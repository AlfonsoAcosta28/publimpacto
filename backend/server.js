// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const passport = require('./config/passport');
const { sequelize } = require('./models');

// Import routes
const authRoutes = require('./routes/authRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const aboutUsRoutes = require('./routes/aboutUsRoutes');
const footerRoutes = require('./routes/footerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const shipping_prices = require('./routes/shoppingPriceRouter')
const addressRoutes = require('./routes/addressRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const serviceOrderRoutes = require('./routes/serviceOrderRoutes');
const productCustomizationRoutes = require('./routes/productCustomizationRoutes');
const camisaRoutes = require('./routes/camisaRoutes');
const colorRoutes = require('./routes/colorRoutes');
const tallaRoutes = require('./routes/tallaRoutes');
const precioCamisaRangoRoutes = require('./routes/precioCamisaRangoRoutes');
// const ordenCamisaRoutes = require('./routes/ordenCamisaRoutes');
const ordenItemCamisaRoutes = require('./routes/ordenItemCamisaRoutes');
const personalizacionImagenRoutes = require('./routes/personalizacionImagenRoutes');
const inventarioCamisaRoutes = require('./routes/inventarioCamisaRoutes');
const cupRoutes = require('./routes/cupRoutes');
const inventoryCupRoutes = require('./routes/inventoryCupRoutes')
const preciosCupRangoroutes = require('./routes/precioCupRangoRoutes')
const quoteRequestRoutes = require('./routes/quoteRequestRoutes')
const finalQuotesRoutes = require('./routes/finalQuoteRoutes')

const app = express();
const PORT = process.env.PORT || 5000; 

// Middlewares
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(passport.initialize());

app.get('/api/health', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    database: sequelize.authenticate()
      .then(() => 'Connected')
      .catch(() => 'Error')
  };
  
  Promise.resolve(healthcheck.database)
    .then(dbStatus => {
      healthcheck.database = dbStatus;
      res.status(200).json(healthcheck);
    })
    .catch(error => {
      healthcheck.message = error;
      res.status(503).json(healthcheck);
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/about-us', aboutUsRoutes);
app.use('/api/footer', footerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/shipping-prices', shipping_prices);
app.use('/api/addresses', addressRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/service-orders', serviceOrderRoutes);
app.use('/api/product-customizations', productCustomizationRoutes);
app.use('/api/camisas', camisaRoutes);
app.use('/api/colores', colorRoutes);
app.use('/api/tallas', tallaRoutes);
app.use('/api/precios-camisa', precioCamisaRangoRoutes);
// app.use('/api/ordenes-camisa', ordenCamisaRoutes);
app.use('/api/ordenes-item-camisa', ordenItemCamisaRoutes);
app.use('/api/personalizaciones-imagen', personalizacionImagenRoutes);
app.use('/api/inventario-camisa', inventarioCamisaRoutes);
app.use('/api/cup', cupRoutes)
app.use('/api/inventario-cup', inventoryCupRoutes)
app.use('/api/precios-cup', preciosCupRangoroutes)
app.use('/api/quote-requests', quoteRequestRoutes)
app.use('/api/final-quotes', finalQuotesRoutes)

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync models with database - set force to true to drop tables in development
    await sequelize.sync({ force: process.env.NODE_ENV === 'development' && process.env.DB_FORCE_SYNC === 'true' });
    console.log('Database synchronized');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API URL: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();