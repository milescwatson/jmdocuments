CREATE DATABASE IF NOT EXISTS `jmdocuments`;

DROP TABLE IF EXISTS `jmdocuments`.`User`;
CREATE TABLE `jmdocuments`.`User` (
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  firstname VARCHAR(64),
  lastname VARCHAR(64),
  email VARCHAR(128),
  role VARCHAR(32),
  salt VARCHAR(128),
  passwordHASH VARCHAR(128),
  createdByUserId INTEGER,
  createdDateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- TODO: CONSTRAINT on createdByUserId.
  INDEX idx_jmdocuments_firstname (firstname),
  INDEX idx_jmdocuments_lastname (lastname),
  INDEX idx_jmdocuments_email (email)
) ENGINE=InnoDB;
INSERT INTO `jmdocuments`.`User` (`id`, `firstname`, `lastname`, `role`, `email`, `salt`, `passwordHASH`, `createdByUserId`)
  VALUES (1, 'Miles', 'Watson', 'admin', 'miles@milescwatson.com', 'abc', '1234567890', 1);
