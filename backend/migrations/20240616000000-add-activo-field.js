'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = [
      'Products',
      'Categories',
      'Banners',
      'Orders',
      'OrderItems',
      'Users',
      'Services',
      'ProductCustomizations',
      'ProductImages',
      'Addresses',
      'AboutUs',
      'Footers',
      'Inventories',
      'ShippingPrices',
      'ServiceDocuments'
    ];

    for (const table of tables) {
      await queryInterface.addColumn(table, 'activo', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tables = [
      'Products',
      'Categories',
      'Banners',
      'Orders',
      'OrderItems',
      'Users',
      'Services',
      'ProductCustomizations',
      'ProductImages',
      'Addresses',
      'AboutUs',
      'Footers',
      'Inventories',
      'ShippingPrices',
      'ServiceDocuments'
    ];

    for (const table of tables) {
      await queryInterface.removeColumn(table, 'activo');
    }
  }
};
