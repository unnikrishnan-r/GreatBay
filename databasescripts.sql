DROP DATABASE IF EXISTS greatbayDB;

CREATE DATABASE greatbayDB;

USE greatbayDB;

CREATE TABLE users (
    user_id INT NOT NULL AUTO_INCREMENT,
    user_name VARCHAR(50) NOT NULL,
    user_password VARCHAR (200) NOT NULL,
    user_email_id VARCHAR(50),
    created_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id)
);

INSERT INTO
    USERS (user_name, user_password, user_email_id)
VALUES
    (
        "unnipbvr",
        sha1('abcdefg'),
        "unnipbvr@gmail.com"
    );

CREATE TABLE products (
    product_id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR (50) NOT NULL,
    product_description VARCHAR (100),
    created_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id)

);

CREATE TABLE `auctions` (
  `auction_id` int(11) NOT NULL AUTO_INCREMENT,
  `auction_name` varchar(50) NOT NULL,
  `auction_owner` int(11) NOT NULL,
  `product_in_auction` int(11) NOT NULL,
  `current_highest_bid` int(11) NOT NULL DEFAULT '0',
  `auction_end_date` datetime DEFAULT NULL,
  `created_ts` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_updated_ts` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`auction_id`),
  KEY `product_id_idx` (`product_in_auction`),
  KEY `user_id_idx` (`auction_owner`),
  CONSTRAINT `product_id` FOREIGN KEY (`product_in_auction`) REFERENCES `products` (`product_id`),
  CONSTRAINT `user_id` FOREIGN KEY (`auction_owner`) REFERENCES `users` (`user_id`)
);

CREATE TABLE `greatbaydb`.`bid_history` (
  `bid_id` INT NOT NULL AUTO_INCREMENT,
  `bidder_user_id` INT NOT NULL,
  `bid_auction_id` INT NOT NULL,
  `bid_amount` VARCHAR(45) NOT NULL,
  `created_ts` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`bid_id`),
  INDEX `auction_id_idx` (`bid_auction_id` ASC) VISIBLE,
  INDEX `user_id_idx` (`bidder_user_id` ASC) VISIBLE,
  CONSTRAINT `auction_id`
    FOREIGN KEY (`bid_auction_id`)
    REFERENCES `greatbaydb`.`auctions` (`auction_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `bidder_user_id`
    FOREIGN KEY (`bidder_user_id`)
    REFERENCES `greatbaydb`.`users` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);