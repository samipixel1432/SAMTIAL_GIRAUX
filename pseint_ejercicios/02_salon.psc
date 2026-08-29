Algoritmo Adecuacion_Salon
	// Contrato
	// Entrada: largo y ancho del salon.
	// Proceso: calcular el area y el perimetro del piso rectangular.
	// Salida: area del salon y perimetro para el zocalo.
	
	Definir largo, ancho, area, perimetro Como Real
	
	Escribir "Ingrese el largo del salon:"
	Leer largo
	
	Escribir "Ingrese el ancho del salon:"
	Leer ancho
	
	area <- largo * ancho
	perimetro <- 2 * (largo + ancho)
	
	Escribir "El area del salon es: ", area
	Escribir "El perimetro del salon es: ", perimetro
FinAlgoritmo
