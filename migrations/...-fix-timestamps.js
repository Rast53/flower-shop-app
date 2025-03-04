module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('categories', 'createdAt');
    await queryInterface.removeColumn('categories', 'updatedAt');
    
    await queryInterface.addColumn('categories', 'created_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });
    
    await queryInterface.addColumn('categories', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });
  },

  async down(queryInterface) {
    // ... обратные операции
  }
}; 