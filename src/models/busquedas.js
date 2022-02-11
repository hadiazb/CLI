const axios = require('axios');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

class Busquedas {
	historial = [];
	dbPath = './src/db/database.json';

	constructor() {
		this.leerDB();
	}

	get historialCapitalizado() {
		return this.historial.map((lugar) => {
			let palabras = lugar.split(' ');
			palabras = palabras.map((p) => p[0].toUpperCase() + p.substring(1));

			return palabras.join(' ');
		});
	}

	get paramsMapbox() {
		return {
			access_token: process.env.access_token,
			language: 'es',
			limit: 5,
		};
	}

	get paramsWeather() {
		return {
			appid: process.env.openweather_api,
			units: 'metric',
			lang: 'es',
		};
	}

	async ciudad(lugar = '') {
		try {
			const intance = axios.create({
				baseURL: process.env.baseURLMAPBOX,
				params: this.paramsMapbox,
			});

			const resp = await intance.get(`/${lugar}.json`);
			return resp.data.features.map((lugar) => ({
				id: lugar.id,
				nombre: lugar.place_name,
				lng: lugar.center[0],
				lat: lugar.center[1],
			}));
		} catch (error) {
			return [];
		}
	}

	async climaLugar(lat, lon) {
		try {
			const intance = axios.create({
				baseURL: process.env.baseURLOPENWEATHER,
				params: { ...this.paramsWeather, lat: lat, lon: lon },
			});

			const resp = await intance.get('/weather?');
			return {
				descripción: `${resp.data.weather[0].description}`,
				temperatura: `${resp.data.main.temp} °C`,
				min: `${resp.data.main.temp_min} °C`,
				max: `${resp.data.main.temp_max} °C`,
			};
		} catch (error) {
			return ['Error'];
		}
	}

	agregarHistorial(lugar = '') {
		if (this.historial.includes(lugar.toLocaleLowerCase())) {
			return;
		}
		this.historial = this.historial.splice(0, 5);
		this.historial.unshift(lugar.toLocaleLowerCase());

		this.guardarDB();
	}

	guardarDB() {
		const payload = {
			historial: this.historial,
		};
		fs.writeFileSync(this.dbPath, JSON.stringify(payload));
	}

	leerDB() {
		if (!fs.existsSync(this.dbPath)) {
			return;
		}

		const archivo = fs.readFileSync(this.dbPath, {
			encoding: 'utf-8',
		});

		const data = JSON.parse(archivo);

		this.historial = data.historial;
	}
}

module.exports = Busquedas;
