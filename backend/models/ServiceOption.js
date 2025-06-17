const ServiceOption = sequelize.define('ServiceOption', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'services',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(100), // Ej: 'medidas', 'cantidad', 'talla'
      allowNull: false
    },
    input_type: {
      type: DataTypes.STRING(50), // text, number, select, file, datetime, etc.
      allowNull: false
    },
    options: {
      type: DataTypes.JSON, // Solo aplica si input_type = 'select' (ej. ["normal", "mágica"])
      allowNull: true
    }
  }, {
    tableName: 'service_options',
    timestamps: true
  });
  