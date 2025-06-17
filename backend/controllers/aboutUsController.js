
const AboutUs = require('../models/AboutUs');

exports.getAboutUs = async (req, res) => {
    try {
        // Get the first record or create if it doesn't exist
        const [aboutUs] = await AboutUs.findOrCreate({
            where: { id: 1 },
            defaults: {
                descripcion: 'Información sobre nuestra tienda',
                ubicacion_texto: 'Ubicación',
                ubicacion_maps: '',
                telefono: '123456789',
                correo: 'contacto@candystore.com'
            }
        });

        res.json(aboutUs);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la información', error: error.message });
    }
};

exports.updateAboutUs = async (req, res) => {
    try {
        const { descripcion, ubicacion_texto, ubicacion_maps, telefono, correo } = req.body;

        console.log('longitud ', ubicacion_maps.length);

        // Find or create the about us record
        const [aboutUs] = await AboutUs.findOrCreate({
            where: { id: 1 },
            defaults: {
                descripcion: 'Información sobre nuestra tienda',
                ubicacion_texto: 'Ubicación',
                ubicacion_maps: '',
                telefono: '123456789',
                correo: 'contacto@candystore.com'
            }
        });

        // Update the record
        await aboutUs.update({
            descripcion: descripcion || aboutUs.descripcion,
            ubicacion_texto: ubicacion_texto || aboutUs.ubicacion_texto,
            ubicacion_maps: ubicacion_maps || aboutUs.ubicacion_maps,
            telefono: telefono || aboutUs.telefono,
            correo: correo || aboutUs.correo
        });

        res.json({
            message: 'Información actualizada exitosamente',
            aboutUs
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la información', error: error.message });
    }
};
