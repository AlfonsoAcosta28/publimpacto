const Service = require('../models/Service');
const ServiceImage = require('../models/ServiceImage');
const { Op } = require('sequelize');

// Obtener todos los servicios (catálogo público)
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      where: {
        deleted_at: null,
        activo: true
      },
      include: [
        {
          model: ServiceImage,
          as: 'images',
          where: { deleted_at: null },
          required: false
        }
      ]
    });
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const servicesWithUrls = services.map(service => {
      const serviceData = service.toJSON();
      const primaryImage = serviceData.images?.find(img => img.is_primary);
      serviceData.image = primaryImage ? `${baseUrl}/${primaryImage.image_url}` : null;
      serviceData.images = serviceData.images?.map(img => ({
        ...img,
        image_url: `${baseUrl}/${img.image_url}`
      }));
      return serviceData;
    });
    res.json(servicesWithUrls);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el catálogo de servicios', error: error.message });
  }
};

// Obtener un servicio por ID (para mostrar detalles)
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findOne({
      where: {
        id: req.params.id,
        deleted_at: null,
        activo: true
      },
      include: [
        {
          model: ServiceImage,
          as: 'images',
          where: { deleted_at: null },
          required: false
        }
      ]
    });
    if (!service) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const serviceData = service.toJSON();
    const primaryImage = serviceData.images?.find(img => img.is_primary);
    serviceData.image = primaryImage ? `${baseUrl}/${primaryImage.image_url}` : null;
    serviceData.images = serviceData.images?.map(img => ({
      ...img,
      image_url: `${baseUrl}/${img.image_url}`
    }));
    res.json(serviceData);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error al obtener el servicio', error: error.message });
  }
};

// Crear un nuevo servicio (solo admin)
exports.createService = async (req, res) => {
  console.log(req.body)
  try {
    let { name, description, base_price, features, applications, short_description } = req.body;
    if (!name || !description || !base_price) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }
    if (!req.files || !req.files.mainImage) {
      return res.status(400).json({ message: 'Se requiere una imagen principal' });
    }
    // Parsear features y applications si vienen como string
    if (typeof features === 'string') {
      try { features = JSON.parse(features); } catch { features = null; }
    }
    if (typeof applications === 'string') {
      try { applications = JSON.parse(applications); } catch { applications = null; }
    }
    const service = await Service.create({
      name: name.trim(),
      description: description.trim(),
      short_description: description.trim(),
      base_price: parseFloat(base_price),
      activo: true,
      features: features || null,
      applications: applications || null
    });
    await ServiceImage.create({
      service_id: service.id,
      image_url: req.files.mainImage[0].path.replace(/\\/g, '/'),
      is_primary: true
    });
    if (req.files.secondaryImages) {
      await Promise.all(req.files.secondaryImages.map(file =>
        ServiceImage.create({
          service_id: service.id,
          image_url: file.path.replace(/\\/g, '/'),
          is_primary: false
        })
      ));
    }
    const completeService = await Service.findOne({
      where: { id: service.id },
      include: [
        { model: ServiceImage, as: 'images' }
      ]
    });
    res.status(201).json(completeService);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error al crear el servicio', error: error.message });
  }
};

// Actualizar un servicio (solo admin)
exports.updateService = async (req, res) => {
  try {
    let { name, description, base_price, activo, features, applications,short_description } = req.body;
    const service = await Service.findOne({
      where: {
        id: req.params.id,
        deleted_at: null
      }
    });
    if (!service) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }
    // Parsear features y applications si vienen como string
    if (typeof features === 'string') {
      try { features = JSON.parse(features); } catch { features = null; }
    }
    if (typeof applications === 'string') {
      try { applications = JSON.parse(applications); } catch { applications = null; }
    }
    await service.update({
      name: name !== undefined ? name : service.name,
      description: description !== undefined ? description : service.description,
      short_description: short_description !== undefined ? short_description : service.short_description,
      base_price: base_price !== undefined ? base_price : service.base_price,
      activo: activo !== undefined ? activo : service.activo,
      features: features !== undefined ? features : service.features,
      applications: applications !== undefined ? applications : service.applications
    });
    // Actualizar imagen principal si se proporciona
    if (req.files && req.files.mainImage) {
      await ServiceImage.destroy({
        where: {
          service_id: service.id,
          is_primary: true
        }
      });
      await ServiceImage.create({
        service_id: service.id,
        image_url: req.files.mainImage[0].path.replace(/\\/g, '/'),
        is_primary: true
      });
    }
    // Actualizar imágenes secundarias si se proporcionan
    if (req.files && req.files.secondaryImages) {
      await ServiceImage.destroy({
        where: {
          service_id: service.id,
          is_primary: false
        }
      });
      await Promise.all(req.files.secondaryImages.map(file =>
        ServiceImage.create({
          service_id: service.id,
          image_url: file.path.replace(/\\/g, '/'),
          is_primary: false
        })
      ));
    }
    const updatedService = await Service.findOne({
      where: { id: service.id },
      include: [
        { model: ServiceImage, as: 'images' }
      ]
    });
    res.json(updatedService);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el servicio', error: error.message });
  }
};

// Eliminar un servicio (soft delete - solo admin)
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findOne({
      where: {
        id: req.params.id,
        deleted_at: null
      }
    });
    if (!service) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }
    await service.update({ deleted_at: new Date() });
    res.json({ message: 'Servicio eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el servicio', error: error.message });
  }
};

// Activar/Desactivar un servicio (solo admin)
exports.toggleServiceStatus = async (req, res) => {
  try {
    const service = await Service.findOne({
      where: {
        id: req.params.id,
        deleted_at: null
      }
    });
    if (!service) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }
    await service.update({ activo: !service.activo });
    res.json({
      message: `Servicio ${service.activo ? 'activado' : 'desactivado'} correctamente`,
      activo: service.activo
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar el estado del servicio', error: error.message });
  }
}; 