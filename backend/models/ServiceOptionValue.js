const ServiceOptionValue = sequelize.define('ServiceOptionValue', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    service_option_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'service_options',
        key: 'id'
      }
    },
    order_id: { // opcional si vinculas con pedidos
      type: DataTypes.INTEGER,
      allowNull: true
    },
    value: {
      type: DataTypes.STRING(255), // Ej: "15x20", "L", "normal", "3pm a 5pm"
      allowNull: false
    }
  }, {
    tableName: 'service_option_values',
    timestamps: true
  });
  