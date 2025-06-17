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
  Inventory
};

