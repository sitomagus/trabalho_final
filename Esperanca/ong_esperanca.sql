CREATE DATABASE ong_esperanca;

USE ong_esperanca;

CREATE TABLE animais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    idade INT NOT NULL,
    sexo ENUM('Macho', 'Fêmea') NOT NULL,
    tipo ENUM('Gato', 'Cachorro') NOT NULL,
    foto VARCHAR(255) NOT NULL,
    adotado BOOLEAN DEFAULT 0
);

CREATE TABLE `doacoes` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `valor` DECIMAL(10,2) NOT NULL,
  `nome` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `data` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
