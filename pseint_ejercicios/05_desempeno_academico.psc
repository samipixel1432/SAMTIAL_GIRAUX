Algoritmo Desempeno_Academico
	// Contrato
	// Entrada: tres calificaciones del estudiante.
	// Proceso: sumar las tres calificaciones y dividir entre 3.
	// Salida: promedio obtenido por el estudiante.
	
	Definir nota1, nota2, nota3, promedio Como Real
	
	Escribir "Ingrese la primera calificacion:"
	Leer nota1
	
	Escribir "Ingrese la segunda calificacion:"
	Leer nota2
	
	Escribir "Ingrese la tercera calificacion:"
	Leer nota3
	
	promedio <- (nota1 + nota2 + nota3) / 3
	
	Escribir "El promedio del estudiante es: ", promedio
FinAlgoritmo
