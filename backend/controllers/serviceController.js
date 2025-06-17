const Service = require('../models/Service');
const ServiceDocument = require('../models/ServiceDocument');
const { Op } = require('sequelize');

// Obtener todos los servicios
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      where: {
        deleted_at: null
      },
      include: [{
        model: ServiceDocument,
        as: 'documents',
        where: {
          deleted_at: null
        },
        required: false
      }]
    });
    res.json(services);
  } catch (error) {
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
      include: [{
        model: ServiceDocument,
        as: 'documents',
        where: {
          deleted_at: null
        },
        required: false
      }]
    });

    if (!service) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el servicio', error: error.message });
  }
};

// Crear un nuevo servicio
exports.createService = async (req, res) => {
  try {
    const { name, description, base_price } = req.body;
    
    const service = await Service.create({
      name,
      description,
      base_price,
      discount_percentage: 0
    });

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el servicio', error: error.message });
  }
};

// Actualizar un servicio
exports.updateService = async (req, res) => {
  try {
    const { name, description, base_price, discount_percentage } = req.body;
    
    const service = await Service.findOne({
      where: {
        id: req.params.id,
        deleted_at: null
      }
    });

    if (!service) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    await service.update({
      name,
      description,
      base_price,
      discount_percentage: discount_percentage || service.discount_percentage
    });

    res.json(service);
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