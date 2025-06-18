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
const ServiceOption = require('./ServiceOption');
const ServiceOptionValue = require('./ServiceOptionValue');
const ServiceImage = require('./ServiceImage');
const ServiceInventory = require('./ServiceInventory');
const ServiceOrder = require('./ServiceOrder');
const ServiceOrderItem = require('./ServiceOrderItem');

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
Service.hasMany(ServiceOption, { foreignKey: 'service_id', as: 'options' });
ServiceOption.belongsTo(Service, { foreignKey: 'service_id' });

Service.hasMany(ServiceImage, { foreignKey: 'service_id', as: 'images' });
ServiceImage.belongsTo(Service, { foreignKey: 'service_id' });

Service.hasMany(ServiceInventory, { foreignKey: 'service_id', as: 'inventory' });
ServiceInventory.belongsTo(Service, { foreignKey: 'service_id' });

ServiceOption.hasMany(ServiceOptionValue, { foreignKey: 'service_option_id', as: 'values' });
ServiceOptionValue.belongsTo(ServiceOption, { foreignKey: 'service_option_id' });

// Asociaciones de ServiceOrder
Service.hasMany(ServiceOrder, { foreignKey: 'service_id', as: 'orders' });
ServiceOrder.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });

ServiceInventory.hasMany(ServiceOrder, { foreignKey: 'variant_id', as: 'orders' });
ServiceOrder.belongsTo(ServiceInventory, { foreignKey: 'variant_id', as: 'variant' });

ServiceOrder.hasMany(ServiceOrderItem, { foreignKey: 'service_order_id', as: 'items' });
ServiceOrderItem.belongsTo(ServiceOrder, { foreignKey: 'service_order_id' });

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
  ServiceOption, 
  ServiceOptionValue,
  ServiceImage,
  ServiceInventory,
  ServiceOrder,
  ServiceOrderItem
};




