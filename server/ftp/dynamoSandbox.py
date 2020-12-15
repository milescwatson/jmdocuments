import boto3
import types
import logging

dynamodb = boto3.resource('dynamodb',region_name='us-east-1')

def createTable():
    table = dynamodb.create_table(
        TableName='jmdocuments',
        KeySchema=[
            {
                'AttributeName': 'documentHash',
                'KeyType': 'HASH'
            },
            {
                'AttributeName': 'pageID',
                'KeyType': 'RANGE'
            }
        ],
        AttributeDefinitions=[
            {
                'AttributeName': 'documentHash',
                'AttributeType': 'S'
            },
            {
                'AttributeName': 'pageID',
                'AttributeType': 'N'
            },
        ],
        ProvisionedThroughput={
            'ReadCapacityUnits': 1,
            'WriteCapacityUnits': 1
        }
    )
    table.meta.client.get_waiter('table_exists').wait(TableName='jmdocuments')
    print(table.item_count)
    with table.batch_writer() as batch:
        batch.put_item(Item={"documentHash":"init", "pageID":2})

def putItems(itemDict):
    dynamodb = boto3.resource('dynamodb',region_name='us-east-1')
    table = dynamodb.Table('jmdocuments')

    def _flush(self):
        items_to_send = self._items_buffer[:self._flush_amount]
        self._items_buffer = self._items_buffer[self._flush_amount:]
        self._response = self._client.batch_write_item(
            RequestItems={self._table_name: items_to_send})
        unprocessed_items = self._response['UnprocessedItems']

        if unprocessed_items and unprocessed_items[self._table_name]:
            # Any unprocessed_items are immediately added to the
            # next batch we send.
            self._items_buffer.extend(unprocessed_items[self._table_name])
        else:
            self._items_buffer = []
        logging.debug("Batch write sent %s, unprocessed: %s",
                     len(items_to_send), len(self._items_buffer))
    try:
        with table.batch_writer() as batch:
                batch._flush=types.MethodType(_flush, batch)
                batch.put_item(Item=itemDict)
                return True
    except Exception as e:
        logging.error('Could not insert table, error: ', e)
        return False

putItems({"documentHash":"neww", "pageID":55})
