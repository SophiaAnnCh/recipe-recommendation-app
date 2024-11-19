const pool = require('../config/db');

const User = {
  findByEmail: async (email) => {
    try {
      const result = await pool.query('CALL FindUserByEmail(?)', [email]);
      console.log('Full result structure:', JSON.stringify(result, null, 2));
      const user = result[0][0][0] || null;
      console.log('Extracted user:', user);
      return user;
    } catch (error) {
      console.error('Error in findByEmail:', error);
      throw error;
    }
  },

  findByUsername: async (username) => {
    try {
      const result = await pool.query('CALL FindUserByUsername(?)', [username]);
      console.log('Full result structure:', JSON.stringify(result, null, 2));
      const user = result[0][0][0] || null;
      console.log('Extracted user:', user);
      
      return user;
    } catch (error) {
      console.error('Error in findByUsername:', error);
      throw error;
    }
  },

  create: async (username, email, password, role) => {
    try {
      const result = await pool.query('CALL CreateUser  (?, ?, ?, ?)', 
        [username, email, password, role]
      ); 
      console.log('Full result structure:', JSON.stringify(result, null, 2));
  
      // Extract the user from the result
      const user = result[0][0] || null; // Adjusted to access the first row directly
      console.log('Extracted user:', user);
      return user;
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }
};

module.exports = User;