Algoritmo Fuente_Circular
	// Contrato
	// Entrada: radio de la fuente circular.
	// Proceso: calcular el area y el perimetro usando pi = 3.1416.
	// Salida: area de la superficie y perimetro de la fuente.
	
	Definir radio, area, perimetro Como Real
	
	Escribir "Ingrese el radio de la fuente:"
	Leer radio
	
	area <- 3.1416 * radio * radio
	perimetro <- 2 * 3.1416 * radio
	
	Escribir "El area de la fuente es: ", area
	Escribir "El perimetro de la fuente es: ", perimetro
FinAlgoritmo
