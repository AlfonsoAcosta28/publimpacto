const sequelize = require('../config/database');
const Banner = require('./Banner');
const Category = require('./Category');
const Product = require('./Product');
const AboutUs = require('./AboutUs');
const Footer = require('./Footer');
const User = require('./User');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const ProductImage = require('./ProductImage');
const Address = require('./Address');
const Inventory = require('./Inventory');
const Service = require('./Service');
const ServiceImage = require('./ServiceImage');
const ServiceOrder = require('./ServiceOrder');
const Camisa = require('./Camisa');
const Color = require('./Color');
const Talla = require('./Talla');
const PrecioCamisaRango = require('./PrecioCamisaRango');
const OrdenCamisa = require('./OrdenCamisa');
const OrdenItemCamisa = require('./OrdenItemCamisa');
const PersonalizacionImagen = require('./PersonalizacionImagen');
const InventarioCamisa = require('./InventarioCamisa');

// Define model associations
Category.hasMany(Product, { foreignKey: 'category_id' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

Order.belongsTo(Address, { foreignKey: 'address_id', as: 'Address' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'OrderItems' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'Product' });
Product.hasMany(OrderItem, { foreignKey: 'product_id' });

Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'ProductImages' });
ProductImage.belongsTo(Product, { foreignKey: 'product_id' });

Address.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Address, { foreignKey: 'user_id', as: 'addresses' });

Address.hasMany(Order, { foreignKey: 'address_id', as: 'orders' });

// Asociaciones de Inventory
Product.hasOne(Inventory, { foreignKey: 'product_id', as: 'inventory' });
Inventory.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Asociaciones de Service
// Service.hasMany(ServiceOption, { foreignKey: 'service_id', as: 'options' });
// ServiceOption.belongsTo(Service, { foreignKey: 'service_id' });

Service.hasMany(ServiceImage, { foreignKey: 'service_id', as: 'images' });
ServiceImage.belongsTo(Service, { foreignKey: 'service_id' });

// Service.hasMany(ServiceInventory, { foreignKey: 'service_id', as: 'inventory' });
// ServiceInventory.belongsTo(Service, { foreignKey: 'service_id' });

// ServiceOption.hasMany(ServiceOptionValue, { foreignKey: 'service_option_id', as: 'values' });
// ServiceOptionValue.belongsTo(ServiceOption, { foreignKey: 'service_option_id' });

// Asociaciones de ServiceOrder (cotizaciones)
User.hasMany(ServiceOrder, { foreignKey: 'user_id', as: 'serviceQuotes' });
ServiceOrder.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Service.hasMany(ServiceOrder, { foreignKey: 'service_id', as: 'quotes' });
ServiceOrder.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });

// ServiceInventory.hasMany(ServiceOrder, { foreignKey: 'variant_id', as: 'quotes' });
// ServiceOrder.belongsTo(ServiceInventory, { foreignKey: 'variant_id', as: 'variant' });

// Asociaciones de Camisa
Camisa.hasMany(Color, { foreignKey: 'id_camisa', as: 'colores' });
Color.belongsTo(Camisa, { foreignKey: 'id_camisa', as: 'camisa' });

Camisa.hasMany(Talla, { foreignKey: 'id_camisa', as: 'tallas' });
Talla.belongsTo(Camisa, { foreignKey: 'id_camisa', as: 'camisa' });

Camisa.hasMany(PrecioCamisaRango, { foreignKey: 'id_camisa', as: 'rangos_precio' });
PrecioCamisaRango.belongsTo(Camisa, { foreignKey: 'id_camisa', as: 'camisa' });

Camisa.hasMany(InventarioCamisa, { foreignKey: 'id_camisa', as: 'inventario' });
InventarioCamisa.belongsTo(Camisa, { foreignKey: 'id_camisa', as: 'camisa' });

// OrdenCamisa y sus relaciones
User.hasMany(OrdenCamisa, { foreignKey: 'user_id', as: 'ordenesCamisa' });
OrdenCamisa.belongsTo(User, { foreignKey: 'user_id', as: 'usuario' });

Address.hasMany(OrdenCamisa, { foreignKey: 'address_id', as: 'ordenesCamisa' });
OrdenCamisa.belongsTo(Address, { foreignKey: 'address_id', as: 'direccion' });

OrdenCamisa.hasMany(OrdenItemCamisa, { foreignKey: 'id_orden_camisa', as: 'items' });
OrdenItemCamisa.belongsTo(OrdenCamisa, { foreignKey: 'id_orden_camisa', as: 'ordenCamisa' });

Camisa.hasMany(OrdenItemCamisa, { foreignKey: 'id_camisa', as: 'ordenesItem' });
OrdenItemCamisa.belongsTo(Camisa, { foreignKey: 'id_camisa', as: 'camisa' });

Talla.hasMany(OrdenItemCamisa, { foreignKey: 'id_talla', as: 'ordenesItem' });
OrdenItemCamisa.belongsTo(Talla, { foreignKey: 'id_talla', as: 'talla' });

Color.hasMany(OrdenItemCamisa, { foreignKey: 'id_color', as: 'ordenesItem' });
OrdenItemCamisa.belongsTo(Color, { foreignKey: 'id_color', as: 'color' });

OrdenItemCamisa.hasMany(PersonalizacionImagen, { foreignKey: 'id_orden_item_camisa', as: 'personalizaciones' });
PersonalizacionImagen.belongsTo(OrdenItemCamisa, { foreignKey: 'id_orden_item_camisa', as: 'ordenItemCamisa' });

Talla.hasMany(InventarioCamisa, { foreignKey: 'id_talla', as: 'inventario' });
InventarioCamisa.belongsTo(Talla, { foreignKey: 'id_talla', as: 'talla' });

Color.hasMany(InventarioCamisa, { foreignKey: 'id_color', as: 'inventario' });
InventarioCamisa.belongsTo(Color, { foreignKey: 'id_color', as: 'color' });

// Export models and sequelize instance
module.exports = {
  sequelize,
  Banner,
  Category,
  Product,
  AboutUs,
  Footer,
  User,
  Order,
  OrderItem,
  ProductImage,
  Address,
  Inventory,
  Service,
  // ServiceOption, 
  // ServiceOptionValue,
  ServiceImage,
  // ServiceInventory,
  ServiceOrder,
  Camisa,
  Color,
  Talla,
  PrecioCamisaRango,
  OrdenCamisa,
  OrdenItemCamisa,
  PersonalizacionImagen,
  InventarioCamisa
};




