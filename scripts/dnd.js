const axios = require("axios")
// consulta de razas
axios.get('https://www.dnd5eapi.co/api/races')
  .then(response => {
    console.log('Razas disponibles:', response.data);
  })
  .catch(error => {
    console.error('Error al obtener las razas:', error);
  });
