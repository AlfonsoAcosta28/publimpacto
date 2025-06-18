const Service = require('../models/Service');
const ServiceImage = require('../models/ServiceImage');
const ServiceOption = require('../models/ServiceOption');
const ServiceOptionValue = require('../models/ServiceOptionValue');
const { Op } = require('sequelize');

// Obtener todos los servicios
exports.getAllServices = async (req, res) => {
  try {
    console.log('Obteniendo todos los servicios...');
    
    const services = await Service.findAll({
      where: {
        deleted_at: null
      },
      include: [
        {
          model: ServiceImage,
          as: 'images',
          where: {
            deleted_at: null
          },
          required: false
        },
        {
          model: ServiceOption,
          as: 'options',
          required: false
        }
      ]
    });
    
    console.log(`Servicios encontrados: ${services.length}`);
    console.log('Servicios:', services.map(s => ({ id: s.id, name: s.name })));
    
    // Agregar URL base a las imágenes
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
    console.error('Error al obtener servicios:', error);
    res.status(500).json({ message: 'Error al obtener los servicios', error: error.message });
  }
};

// Obtener un servicio por ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findOne({
      where: {
        id: req.params.id,
        deleted_at: null
      },
      include: [
        {
          model: ServiceImage,
          as: 'images',
          where: {
            deleted_at: null
          },
          required: false
        },
        {
          model: ServiceOption,
          as: 'options',
          required: false
        }
      ]
    });

    if (!service) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    // Agregar URL base a las imágenes
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
    res.status(500).json({ message: 'Error al obtener el servicio', error: error.message });
  }
};

// Crear un nuevo servicio
exports.createService = async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);
    console.log('Archivos recibidos:', req.files);
    
    const { name, description, base_price, options } = req.body;
    
    // Validar que los campos requeridos estén presentes
    if (!name || !description || !base_price) {
      return res.status(400).json({ 
        message: 'Faltan campos requeridos', 
        missing: {
          name: !name,
          description: !description,
          base_price: !base_price
        }
      });
    }

    // Validar que se haya subido una imagen principal
    if (!req.files || !req.files.mainImage) {
      return res.status(400).json({ 
        message: 'Se requiere una imagen principal' 
      });
    }

    // Parsear las opciones si existen
    let parsedOptions = [];
    if (options) {
      try {
        parsedOptions = JSON.parse(options);
      } catch (e) {
        console.log('Error parsing options:', e);
        parsedOptions = [];
      }
    }
    
    // Crear el servicio
    const service = await Service.create({
      name: name.trim(),
      description: description.trim(),
      base_price: parseFloat(base_price),
      discount_percentage: 0
    });

    console.log('Servicio creado:', service.id);

    // Crear las opciones del servicio si existen
    if (parsedOptions && Array.isArray(parsedOptions)) {
      await Promise.all(parsedOptions.map(option => 
        ServiceOption.create({
          service_id: service.id,
          name: option.name,
          input_type: option.input_type,
          options: option.options
        })
      ));
    }

    // Crear la imagen principal
    await ServiceImage.create({
      service_id: service.id,
      image_url: req.files.mainImage[0].path.replace(/\\/g, '/'),
      is_primary: true
    });

    // Crear las imágenes secundarias si existen
    if (req.files.secondaryImages) {
      await Promise.all(req.files.secondaryImages.map(file => 
        ServiceImage.create({
          service_id: service.id,
          image_url: file.path.replace(/\\/g, '/'),
          is_primary: false
        })
      ));
    }

    // Obtener el servicio completo con sus relaciones
    const completeService = await Service.findOne({
      where: { id: service.id },
      include: [
        { model: ServiceOption, as: 'options' },
        { model: ServiceImage, as: 'images' }
      ]
    });

    console.log('Servicio completo obtenido:', completeService ? 'SÍ' : 'NO');

    if (!completeService) {
      throw new Error('No se pudo obtener el servicio creado');
    }

    res.status(201).json(completeService);
  } catch (error) {
    console.error('Error completo:', error);
    res.status(500).json({ message: 'Error al crear el servicio', error: error.message });
  }
};

// Actualizar un servicio
exports.updateService = async (req, res) => {
  try {
    const { name, description, base_price, discount_percentage, options } = req.body;
    
    const service = await Service.findOne({
      where: {
        id: req.params.id,
        deleted_at: null
      }
    });

    if (!service) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    // Actualizar datos básicos del servicio
    await service.update({
      name,
      description,
      base_price,
      discount_percentage: discount_percentage || service.discount_percentage
    });

    // Actualizar opciones si se proporcionan
    if (options && Array.isArray(options)) {
      // Eliminar opciones existentes
      await ServiceOption.destroy({
        where: { service_id: service.id }
      });

      // Crear nuevas opciones
      await Promise.all(options.map(option => 
        ServiceOption.create({
          service_id: service.id,
          name: option.name,
          input_type: option.input_type,
          options: option.options
        })
      ));
    }

    // Actualizar imagen principal si se proporciona
    if (req.files && req.files.mainImage) {
      // Eliminar imagen principal anterior
      await ServiceImage.destroy({
        where: { 
          service_id: service.id,
          is_primary: true
        }
      });

      // Crear nueva imagen principal
      await ServiceImage.create({
        service_id: service.id,
        image_url: req.files.mainImage[0].path.replace(/\\/g, '/'),
        is_primary: true
      });
    }

    // Actualizar imágenes secundarias si se proporcionan
    if (req.files && req.files.secondaryImages) {
      // Eliminar imágenes secundarias anteriores
      await ServiceImage.destroy({
        where: { 
          service_id: service.id,
          is_primary: false
        }
      });

      // Crear nuevas imágenes secundarias
      await Promise.all(req.files.secondaryImages.map(file => 
        ServiceImage.create({
          service_id: service.id,
          image_url: file.path.replace(/\\/g, '/'),
          is_primary: false
        })
      ));
    }

    // Obtener el servicio actualizado con sus relaciones
    const updatedService = await Service.findOne({
      where: { id: service.id },
      include: [
        { model: ServiceOption, as: 'options' },
        { model: ServiceImage, as: 'images' }
      ]
    });

    res.json(updatedService);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el servicio', error: error.message });
  }
};

// Eliminar un servicio (soft delete)
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

// Subir documento para un servicio
exports.uploadServiceDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha proporcionado ningún archivo' });
    }

    const service = await Service.findOne({
      where: {
        id: req.params.id,
        deleted_at: null
      }
    });

    if (!service) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    const document = await ServiceDocument.create({
      service_id: service.id,
      file_path: req.file.path,
      file_name: req.file.originalname,
      file_type: req.file.mimetype
    });

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error al subir el documento', error: error.message });
  }
};

// Eliminar documento de un servicio
exports.deleteServiceDocument = async (req, res) => {
  try {
    const document = await ServiceDocument.findOne({
      where: {
        id: req.params.documentId,
        service_id: req.params.id,
        deleted_at: null
      }
    });

    if (!document) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    await document.update({ deleted_at: new Date() });
    res.json({ message: 'Documento eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el documento', error: error.message });
  }
}; 