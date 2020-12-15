CREATE DATABASE IF NOT EXISTS `jmdocuments`;

DROP TABLE IF EXISTS `jmdocuments`.`Documents`;
CREATE TABLE `jmdocuments`.`Documents` (
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  originalFileName VARCHAR(128),
  pageID INTEGER,
  s3Key VARCHAR(128),
  s3ThumbnailKey VARCHAR(128),
  unstructuredOCR MEDIUMTEXT,
  createdDateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_jmdocuments_originalFileName (originalFileName)
) ENGINE=InnoDB;

INSERT INTO `jmdocuments`.`Documents` (`id`, `originalFileName`, `pageID`, `s3Key`, `s3ThumbnailKey`, `unstructuredOCR`)
  VALUES (1, 'originalFileName', 2 , 's3Key', 's3ThumbnailKey', 'unstructuredOCr');
