// controllers/addressController.js
const Address = require('../models/Address');

exports.getAllAddresses = async (req, res) => {
  try {
    // Solo obtener direcciones del usuario autenticado
    const userId = req.user.id;
    
    const addresses = await Address.findAll({
      where: { user_id: userId },
      order: [
        ['es_principal', 'DESC'],
        ['created_at', 'DESC']
      ]
    });

    res.json(addresses);
  } catch (error) {
    console.error('Error al obtener direcciones:', error);
    res.status(500).json({ message: 'Error al obtener direcciones', error: error.message });
  }
};

exports.getAddressById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const address = await Address.findOne({
      where: { 
        id: id,
        user_id: userId
      }
    });

    if (!address) {
      return res.status(404).json({ message: 'Dirección no encontrada' });
    }

    res.json(address);
  } catch (error) {
    console.error('Error al obtener dirección:', error);
    res.status(500).json({ message: 'Error al obtener dirección', error: error.message });
  }
};

exports.createAddress = async (req, res) => {
  // console.log(req.body);
  try {
    const userId = req.user.id;
    const {
      nombre,
      calle,
      numero_calle,
      colonia,
      ciudad,
      estado,
      codigo_postal,
      referencias,
      descripcion_casa,
      horario_preferido,
      es_principal
    } = req.body;

    // Validaciones básicas
    if (!calle || !numero_calle || !colonia || !ciudad || !estado || !codigo_postal || !nombre) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    // Si la dirección se marca como principal, actualizar las demás direcciones
    if (es_principal) {
      await Address.update(
        { es_principal: false },
        { where: { user_id: userId } }
      );
    }

    // Verificar si es la primera dirección del usuario
    const addressCount = await Address.count({ where: { user_id: userId } });
    const isFirstAddress = addressCount === 0;

    // Si es la primera dirección, marcarla como principal automáticamente
    const newAddress = await Address.create({
      user_id: userId,
      nombre,
      calle,
      numero_calle,
      colonia,
      ciudad,
      estado,
      codigo_postal,
      referencias,
      descripcion_casa,
      horario_preferido,
      es_principal: isFirstAddress ? true : es_principal || false,
    });

    res.status(201).json({
      message: 'Dirección creada exitosamente',
      address: newAddress
    });
  } catch (error) {
    console.error('Error al crear dirección:', error);
    res.status(500).json({ message: 'Error al crear dirección', error: error.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      nombre,
      calle,
      numero_calle,
      colonia,
      ciudad,
      estado,
      codigo_postal,
      referencias,
      descripcion_casa,
      horario_preferido,
      es_principal
    } = req.body;

    // Verificar que la dirección exista y pertenezca al usuario
    const address = await Address.findOne({
      where: { 
        id: id,
        user_id: userId
      }
    });

    if (!address) {
      return res.status(404).json({ message: 'Dirección no encontrada' });
    }

    // Si la dirección se marca como principal, actualizar las demás direcciones
    if (es_principal && !address.es_principal) {
      await Address.update(
        { es_principal: false },
        { where: { user_id: userId } }
      );
    }

    // Actualizar la dirección
    await address.update({
      nombre: nombre || address.nombre,
      calle: calle || address.calle,
      numero_calle: numero_calle || address.numero_calle,
      colonia: colonia || address.colonia,
      ciudad: ciudad || address.ciudad,
      estado: estado || address.estado,
      codigo_postal: codigo_postal || address.codigo_postal,
      referencias: referencias !== undefined ? referencias : address.referencias,
      descripcion_casa: descripcion_casa !== undefined ? descripcion_casa : address.descripcion_casa,
      horario_preferido: horario_preferido !== undefined ? horario_preferido : address.horario_preferido,
      es_principal: es_principal !== undefined ? es_principal : address.es_principal
    });

    res.json({
      message: 'Dirección actualizada exitosamente',
      address
    });
  } catch (error) {
    console.error('Error al actualizar dirección:', error);
    res.status(500).json({ message: 'Error al actualizar dirección', error: error.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar que la dirección exista y pertenezca al usuario
    const address = await Address.findOne({
      where: { 
        id: id,
        user_id: userId
      }
    });

    if (!address) {
      return res.status(404).json({ message: 'Dirección no encontrada' });
    }

    // Verificar si es la única dirección del usuario
    const addressCount = await Address.count({ where: { user_id: userId } });
    if (addressCount === 1) {
      return res.status(400).json({ 
        message: 'No se puede eliminar la única dirección registrada. Debe tener al menos una dirección.' 
      });
    }

    // Verificar si es la dirección principal
    if (address.es_principal) {
      // Buscar otra dirección para establecerla como principal
      const otherAddress = await Address.findOne({
        where: { 
          user_id: userId,
          id: { $ne: id }
        }
      });

      if (otherAddress) {
        await otherAddress.update({ es_principal: true });
      }
    }

    // Eliminar la dirección
    await address.destroy();

    res.json({
      message: 'Dirección eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar dirección:', error);
    res.status(500).json({ message: 'Error al eliminar dirección', error: error.message });
  }
};

exports.setDefaultAddress = async (req, res) => {
  console.log(req.params);
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar que la dirección exista y pertenezca al usuario
    const address = await Address.findOne({
      where: { 
        id: id,
        user_id: userId
      }
    });

    if (!address) {
      return res.status(404).json({ message: 'Dirección no encontrada' });
    }

    // Actualizar todas las direcciones a no principal
    await Address.update(
      { es_principal: false },
      { where: { user_id: userId } }
    );

    // Establecer la dirección seleccionada como principal
    await address.update({ es_principal: true });

    res.json({
      message: 'Dirección establecida como principal',
      address
    });
  } catch (error) {
    console.error('Error al establecer dirección principal:', error);
    res.status(500).json({ message: 'Error al establecer dirección principal', error: error.message });
  }
};