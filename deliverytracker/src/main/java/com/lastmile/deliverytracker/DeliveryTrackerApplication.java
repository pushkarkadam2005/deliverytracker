package com.lastmile.deliverytracker;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@SpringBootApplication
public class DeliveryTrackerApplication {

	private static final Logger log = LoggerFactory.getLogger(DeliveryTrackerApplication.class);

	public static void main(String[] args) {
		loadEnv();
		SpringApplication.run(DeliveryTrackerApplication.class, args);
	}

	private static void loadEnv() {
		Path path = Paths.get(".env");
		if (Files.exists(path)) {
			try {
				List<String> lines = Files.readAllLines(path);
				for (String line : lines) {
					line = line.trim();
					if (line.isEmpty() || line.startsWith("#")) {
						continue;
					}
					int index = line.indexOf('=');
					if (index > 0) {
						String key = line.substring(0, index).trim();
						String value = line.substring(index + 1).trim();
						// Strip surrounding quotes
						if (value.startsWith("\"") && value.endsWith("\"") && value.length() >= 2) {
							value = value.substring(1, value.length() - 1);
						} else if (value.startsWith("'") && value.endsWith("'") && value.length() >= 2) {
							value = value.substring(1, value.length() - 1);
						}
						// Only set if not already set as a System property (e.g. from command line)
						if (System.getProperty(key) == null) {
							System.setProperty(key, value);
						}
					}
				}
			} catch (IOException e) {
				log.warn("Failed to load .env file: {}", e.getMessage(), e);
			}
		}
	}
}

