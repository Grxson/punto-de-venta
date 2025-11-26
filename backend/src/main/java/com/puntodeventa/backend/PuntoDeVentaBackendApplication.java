package com.puntodeventa.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.puntodeventa.backend")
public class PuntoDeVentaBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(PuntoDeVentaBackendApplication.class, args);
	}

}
