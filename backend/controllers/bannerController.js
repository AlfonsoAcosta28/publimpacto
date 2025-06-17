const Banner = require('../models/Banner');
const fs = require('fs');
const path = require('path');

exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({
      order: [['created_at', 'DESC']]
    });

    // Construir la URL completa de la imagen
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    banners.forEach(banner => {
      if (banner.imagen) {
        banner.imagen = `${baseUrl}${banner.imagen}`;
      }
    });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los banners', error: error.message });
  }
};

exports.getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner no encontrado' });
    }

    // Construir la URL completa de la imagen
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const bannerData = banner.toJSON();

    if (bannerData.imagen) {
      bannerData.imagen = `${baseUrl}${bannerData.imagen}`;
    }

    res.json(bannerData);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el banner', error: error.message });
  }
};

exports.createBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'La imagen es requerida' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    const { titulo, subtitulo, descripcion, tituloBoton, linkBoton, color } = req.body;

    const banner = await Banner.create({
      titulo,
      subtitulo,
      descripcion,
      tituloBoton,
      linkBoton,
      imagen: imageUrl,
      color
    });

    // Construir la URL completa de la imagen
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const bannerData = banner.toJSON();
    bannerData.imagen = `${baseUrl}${bannerData.imagen}`;

    res.status(201).json({
      message: 'Banner creado exitosamente',
      banner: bannerData
    });
  } catch (error) {
    // Si hay un error, eliminar la imagen subida
    if (req.file) {
      const imagePath = path.join(__dirname, '../', req.file.path);
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Error al eliminar la imagen:', err);
      });
    }
    res.status(500).json({ message: 'Error al crear el banner', error: error.message });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner no encontrado' });
    }

    const { titulo, subtitulo, descripcion, tituloBoton, linkBoton, color } = req.body;
    const updateData = { titulo, subtitulo, descripcion, tituloBoton, linkBoton, color };

    // Si se subió una nueva imagen
    if (req.file) {
      // Eliminar la imagen anterior
      if (banner.imagen) {
        const oldImagePath = path.join(__dirname, '../', banner.imagen);
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error('Error al eliminar la imagen anterior:', err);
        });
      }

      // Actualizar con la nueva imagen
      updateData.imagen = `/uploads/${req.file.filename}`;
    }

    await banner.update(updateData);

    // Construir la URL completa de la imagen
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const bannerData = banner.toJSON();
    if (bannerData.imagen) {
      bannerData.imagen = `${baseUrl}${bannerData.imagen}`;
    }

    res.json({
      message: 'Banner actualizado exitosamente',
      banner: bannerData
    });
  } catch (error) {
    // Si hay un error y se subió una nueva imagen, eliminarla
    if (req.file) {
      const imagePath = path.join(__dirname, '../', req.file.path);
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Error al eliminar la imagen:', err);
      });
    }
    res.status(500).json({ message: 'Error al actualizar el banner', error: error.message });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner no encontrado' });
    }

    // Eliminar la imagen asociada
    if (banner.imagen) {
      const imagePath = path.join(__dirname, '../', banner.imagen);
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Error al eliminar la imagen:', err);
      });
    }

    await banner.destroy();
    res.json({ message: 'Banner eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el banner', error: error.message });
  }
};
