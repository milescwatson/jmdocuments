USE jmdocuments;

DELIMITER //

CREATE OR REPLACE PROCEDURE getByPage (
  IN pageNumber INTEGER,
  IN pageDivision INTEGER
)

 BEGIN
   DECLARE lowerLimitPosition INTEGER;
   DECLARE lowerLimitPositionLessOne INTEGER;
   DECLARE allToPosition INTEGER;
   DECLARE idOfLowerPosition INTEGER;

   SET lowerLimitPosition = (pageNumber*pageDivision);
   SET lowerLimitPositionLessOne = (lowerLimitPosition-1);

   SET idOfLowerPosition = (WITH allResults (id) AS (SELECT id FROM Documents ORDER BY id DESC LIMIT lowerLimitPosition) SELECT id FROM allResults LIMIT 1 OFFSET lowerLimitPositionLessOne);
   SELECT idOfLowerPosition;

   -- SELECT id,originalFileName,pageID,s3Key,s3ThumbnailKey, unstructuredOCR FROM Documents WHERE id>=idOfLowerPosition ORDER BY id DESC LIMIT pageDivision;
   -- WITH
   -- SELECT id, pageID FROM Documents WHERE id>=idOfLowerPosition ORDER BY id DESC LIMIT 50;

   -- ORDER BY id DESC LIMIT pageDivision;

   -- SET lowerLimitPosition = (SELECT id FROM Documents ORDER BY id DESC LIMIT ?)
   --
   -- SET identicalSymbolStrategyTitle = (SELECT strategyParsedText FROM Strategies WHERE ticker=in_symbol AND strategyParsedText = in_strategyParsedText LIMIT 1);
   --
   -- IF (identicalTickerCount > 0 AND (identicalSymbolStrategyTitle = in_strategyParsedText))
   -- THEN
   --  SET identicalSymbolID = (select id From Strategies WHERE ticker=in_symbol ORDER BY CreatedDateTime ASC LIMIT 1);
   --  -- UPDATE Strategies SET createdDateTime=NOW() WHERE id=identicalSymbolID;
   -- ELSE
   --  INSERT INTO Strategies (ticker, exchange, strategyDirection, strategyParsedText, emailBodyText)
   --  VALUES(in_symbol, in_exchange, in_strategyDirection, in_strategyParsedText, in_emailBodyText);
   -- END IF;

 END //

DELIMITER ;

-- CALL simpleProc2('BLOOM', 'NYSE', 'BULLISH', '$$_UP_STRAT', '<body></body>');
