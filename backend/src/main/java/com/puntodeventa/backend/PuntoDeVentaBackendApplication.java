package com.puntodeventa.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@ComponentScan(basePackages = "com.puntodeventa.backend")
@EnableCaching
@EnableAsync
public class PuntoDeVentaBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(PuntoDeVentaBackendApplication.class, args);
	}

}
