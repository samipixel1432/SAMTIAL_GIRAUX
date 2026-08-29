Algoritmo Zona_Verde
	// Contrato
	// Entrada: base y altura del terreno triangular.
	// Proceso: calcular el area multiplicando base por altura y dividiendo entre 2.
	// Salida: area de la zona verde.
	
	Definir base, altura, area Como Real
	
	Escribir "Ingrese la base del terreno:"
	Leer base
	
	Escribir "Ingrese la altura del terreno:"
	Leer altura
	
	area <- (base * altura) / 2
	
	Escribir "El area de la zona verde es: ", area
FinAlgoritmo
