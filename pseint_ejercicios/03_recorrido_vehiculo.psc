Algoritmo Recorrido_Vehiculo
	// Contrato
	// Entrada: velocidad en kilometros por hora y tiempo en horas.
	// Proceso: calcular la distancia multiplicando velocidad por tiempo.
	// Salida: distancia recorrida en kilometros.
	
	Definir velocidad, tiempo, distancia Como Real
	
	Escribir "Ingrese la velocidad del vehiculo en km/h:"
	Leer velocidad
	
	Escribir "Ingrese el tiempo de recorrido en horas:"
	Leer tiempo
	
	distancia <- velocidad * tiempo
	
	Escribir "La distancia recorrida es: ", distancia, " kilometros"
FinAlgoritmo
