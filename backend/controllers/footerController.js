
const Footer = require('../models/Footer');

exports.getFooter = async (req, res) => {
    try {
        // Get the first record or create if it doesn't exist
        const [footer] = await Footer.findOrCreate({
            where: { id: 1 },
            defaults: {
                nombre_tienda: 'Candy Store',
                branding: 'La mejor tienda de dulces',
                facebook: '',
                instagram: '',
                tiktok: '',
                otras_redes: {}
            }
        });

        res.json(footer);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la información del footer', error: error.message });
    }
};

exports.updateFooter = async (req, res) => {
    try {
        const { nombre_tienda, branding, facebook, instagram, tiktok, otras_redes } = req.body;

        // Find or create the footer record
        const [footer] = await Footer.findOrCreate({
            where: { id: 1 },
            defaults: {
                nombre_tienda: 'Candy Store',
                branding: 'La mejor tienda de dulces',
                facebook: '',
                instagram: '',
                tiktok: '',
                otras_redes: {}
            }
        });

        // Update the record
        await footer.update({
            nombre_tienda: nombre_tienda || footer.nombre_tienda,
            branding: branding || footer.branding,
            facebook: facebook !== undefined ? facebook : footer.facebook,
            instagram: instagram !== undefined ? instagram : footer.instagram,
            tiktok: tiktok !== undefined ? tiktok : footer.tiktok,
            otras_redes: otras_redes || footer.otras_redes
        });

        res.json({
            message: 'Footer actualizado exitosamente',
            footer
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el footer', error: error.message });
    }
};