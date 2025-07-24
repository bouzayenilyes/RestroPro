/* 
tokens {id, invoice_id, token_no, status}



CREATE SEQUENCE my_token_sequence
START WITH 1
INCREMENT BY 1;

CREATE TRIGGER before_insert_token
BEFORE INSERT ON tokens
FOR EACH ROW
BEGIN
    SET NEW.token_number = (SELECT nextval(my_token_sequence));
END;


-- this delete command will be in CRON Job
DELETE FROM tokens
WHERE date <= CURDATE() AND status = 'DONE';
ALTER SEQUENCE my_token_sequence RESTART WITH 1;

*/