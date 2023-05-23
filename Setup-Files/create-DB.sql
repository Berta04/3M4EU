CREATE DATABASE `mmm`

CREATE TABLE `users` (
  `idusers` int NOT NULL AUTO_INCREMENT,
  `username` varchar(45) NOT NULL,
  `password` blob NOT NULL,
  `email` varchar(100) NOT NULL,
  `accountdate` date NOT NULL,
  `token` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`idusers`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE sql11521561.`users` (
  `idusers` int NOT NULL AUTO_INCREMENT,
  `username` varchar(45) NOT NULL,
  `password` blob NOT NULL,
  `email` varchar(100) NOT NULL,
  `accountdate` date NOT NULL,
  `token` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`idusers`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8_general_ci COLLATE=utf8_general_ci;