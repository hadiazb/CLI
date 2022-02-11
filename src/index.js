const {
	leerInput,
	inquirerMenu,
	pausa,
	listarLugares,
} = require('./helpers/inquirer');
const Busquedas = require('./models/busquedas');

const main = async () => {
	const busquedas = new Busquedas();
	let opt;

	do {
		opt = await inquirerMenu();

		switch (opt) {
			case 1:
				const termino = await leerInput('Ciudad: ');

				const lugares = await busquedas.ciudad(termino);

				const id = await listarLugares(lugares);
				if (id === '0') {
					continue;
				}

				const lugarSelec = lugares.find((lugar) => lugar.id === id);

				busquedas.agregarHistorial(lugarSelec.nombre);

				const weather = await busquedas.climaLugar(
					lugarSelec.lat,
					lugarSelec.lat
				);

				console.log('\nInformación de la ciudad\n'.green);
				console.log('Ciudad: ', lugarSelec.nombre.green);
				console.log('Lat: ', lugarSelec.lat);
				console.log('Lng: ', lugarSelec.lng);
				console.log('Temperatura: ', weather.temperatura.green);
				console.log('Mínima: ', weather.min.green);
				console.log('Máxima: ', weather.max.green);
				console.log('Como esta el clima: ', weather.descripción.green);

				break;
			case 2:
				busquedas.historialCapitalizado.forEach((lugar, i) => {
					const idx = `${i + 1}`.green;
					console.log(`${idx} ${lugar}`);
				});
				break;
		}
		if (opt !== 0) await pausa(opt);
	} while (opt !== 0);
};

main();
