# This is run periodically to gather and parse certification documents
# test pages: 10-30
# t3.small ocr seconds per page: 3.35
#  t3.nano ocr seconds per page: 3.5
import os
import io
import time
from pathlib import Path
import logging
from logging.handlers import RotatingFileHandler
import PyPDF2 as pdf
from pdf2image import convert_from_bytes, convert_from_path
from PIL import Image
import pytesseract
import random
import boto3
# import types
# import pickle
import tempfile
import mariadb
logName = 'main.log'
logging.basicConfig(filename=logName, level=logging.DEBUG,
                    format='%(asctime)s:%(levelname)s:%(message)s')
log = logging.getLogger()
handler = RotatingFileHandler(logName, maxBytes=4096, backupCount=1)
log.addHandler(handler)

def getConnection():
    try:
        conn = mariadb.connect(
            user="jmdocs",
            password="N7C7C32ednUHIb0FOAcUSSwz",
            host="localhost",
            port=3306,
            database="jmdocuments"
        )
        return conn
    except mariadb.Error as e:
        print(f"Error connecting to MariaDB Platform: {e}")
        return None

class PageObject(object):
    def __init__(self, pdf, image, pageID):
        self.pdf = pdf # stored as binary
        self.pageID = pageID
        self.ocrUnstructured = None
        self.image = image
        self.s3Key = None
        self.s3ThumbnailKey = None
        self.uploadMetadataSuccess= False
        self.uploadSuccess = False
        self.ocrSuccess = False
        self.thumb = None

class DocumentObj(object):
    """An unparsed document"""
    def __init__(self, documentName):
        self.documentName = documentName
        # PDF Storage Arrays
        self.originalDocumentOpen = None
        self.fileReader = None
        self.pageObjects = []

        self.uploadMetadataSuccess = False
        self.uploadSuccess = False

    # def __exit__(self):
        # self.originalDocumentOpen.close()

    def putItems(self, connection, itemDict):
        try:
            cur = connection.cursor()
            cur.execute("INSERT INTO Documents(originalFileName, pageID, s3Key, s3ThumbnailKey, unstructuredOCR) VALUES (?, ?, ?, ?, ?)",
            (self.documentName, itemDict['pageID'], itemDict['s3Key'], itemDict['s3ThumbnailKey'], itemDict['unstructuredOCR']))
            connection.commit()
            print(f"Last Inserted ID: {cur.lastrowid}")
        except mariadb.Error as e:
            print('Error, could not upload metadata', e)
            logging.error("Could not upload metadata: ", e)
            connection.commit()
            print(f"Last Inserted ID: {cur.lastrowid}")
            connection.close()

    def openDocument(self):
        # self.originalDocumentOpen = open('cd-upload-target/'+self.documentName, mode="rb")
        print('originalDocumentOpen = ', self.originalDocumentOpen);
        # self.fileReader = pdf.PdfFileReader(self.originalDocumentOpen)
        self.fileReader = pdf.PdfFileReader('cd-upload-target/'+self.documentName)

    def generatePageObjects(self):
        # Generate images
        try:
            print('running PDF2PPM')
            with tempfile.TemporaryDirectory() as path:
                imagesByPage = convert_from_path(('cd-upload-target/'+self.documentName), grayscale=True, dpi=150, output_folder=path)

            for page in range(self.fileReader.getNumPages()):
                print('Generating pageObject (PDF, Full Size Image) For Page ', page)
                # write each page as pdf object to pageObjectsBin
                output = pdf.PdfFileWriter()
                output.addPage(self.fileReader.getPage(page))
                pageBin = io.BytesIO()
                output.write(pageBin)
                pageObject = PageObject(pageBin, imagesByPage[page], page)
                self.pageObjects.append(pageObject)
                # pageBin.close()
                # del pageBin
                # del pageObject

        except Exception as e:
            logging.error("Could not generate page objects, error: ",e)

    def generateThumbnails(self):
        print('generateThumbnails')
        for page in self.pageObjects:
            print('Generating thumbnail For Page ', page.pageID)
            thumbImage = page.image.copy()
            thumbImage.thumbnail((256,256))
            thumbnailBin = io.BytesIO()
            thumbImage.save(thumbnailBin, "JPEG")
            page.thumb = thumbnailBin

    def unstructuredOCR(self):
        try:
            for page in self.pageObjects:
                if(page.ocrSuccess != True):
                    try:
                        print('Generating OCR For Page ', page.pageID)
                        page.ocrUnstructured = pytesseract.image_to_string(page.image)
                        # page.ocrUnstructured = 'ocrPlaceholder'
                    except Exception as e:
                        print('error generating OCR')
                        logging.error("Could not generate OCR for page: ", page.pageID, "error: ", e)

        except Exception as e:
            logging.error("Could not generate unstructuredOCR, error: ", e)

    def uploadS3AndMetadata(self):
        print('uploading s3 + metadata')
        s3 = boto3.resource('s3')
        bucket = s3.Bucket('jmdocuments2')
        gmt = time.gmtime(time.time())
        hash = str(gmt.tm_mon)+'-'+str(gmt.tm_wday)+'-'+str(gmt.tm_year)+' '+ str(gmt.tm_hour)+':'+str(gmt.tm_min)+':'+str(gmt.tm_sec)+''+' '+str(int(round(random.random()*100,0)))

        def uploadS3():
            anyPageFailed = False
            for page in self.pageObjects:
                if(page.uploadSuccess != True):
                    try:
                        print('Uploading thumbnail and PDF To S3 for page ', page.pageID)
                        s3Key = '('+str(page.pageID)+') ' + str(hash)+'.pdf'
                        s3ThumbKey = '_thumb_('+str(page.pageID)+') ' + str(hash)+'.jpg'
                        asciOCR = ''.join(str(ord(c)) for c in page.ocrUnstructured)
                        s3UploadRes = ((bucket.put_object(Key=s3Key, Body=page.pdf.getvalue(), Metadata={'pageID':str(page.pageID), 'PossibleAttributes': "{}" })))
                        s3ThumbnailUploadRes = ((bucket.put_object(Key=s3ThumbKey, Body=page.thumb.getvalue(), Metadata={'pageID':str(page.pageID) })))
                        page.s3Key = s3UploadRes.key
                        page.s3ThumbnailKey = s3ThumbnailUploadRes.key
                        page.uploadSuccess = True
                    except Exception as e:
                        anyPageFailed = True
                        print('could not upload individual pageID ', page.pageID)
                        logging.error('could not upload individual pageID ', page.pageID)
            return (not anyPageFailed)

        def uploadMetadata():
            anyPageFailed = False
            connection = getConnection()
            for page in self.pageObjects:
                if(page.uploadMetadataSuccess != True):
                    print('uploadingMetadata for page', page.pageID)
                    try:
                        self.putItems(connection, {"documentHash": hash, "pageID": page.pageID, "s3Key": page.s3Key, "s3ThumbnailKey": page.s3ThumbnailKey, "unstructuredOCR":page.ocrUnstructured, "originalFileName": self.documentName})
                        page.uploadMetadataSuccess = True
                    except Exception as e:
                        anyPageFailed = True
                        print('page ', page.pageID, 'failed to upload metadata')
                        logging.error('could not upload metadata, error: ', e)
            return (not anyPageFailed)


        try:
            self.uploadSuccess = uploadS3()
            s3Retry = 0
            while (s3Retry <= 3 and (not self.uploadSuccess)):
                self.uploadSuccess = uploadS3()
                s3Retry+=1
                time.sleep(4)
                # logging.error('uploadS3AndMetadata S3 upload Error, key = ', hash, 'retry result = ', retryRes)
            if(self.uploadSuccess):
                self.uploadMetadataSuccess = uploadMetadata()
            else:
                print('Not inserting pages to database, because S3 upload failed')

            # if(not self.uploadMetadataSuccess):
                # time.sleep(4)
                # retryRes = uploadMetadata()
                # print('error uploading metadata, retry result = ', retryRes)
                # if(not retryRes):
                    # logging.error('uploadS3AndMetadata Metadata upload Error key = ', hash)

        except Exception as e:
            logging.error('uploadS3AndMetadata Error')

    def printStatus(self):
        print('uploadMetadataSuccess: ', self.uploadMetadataSuccess)
        print('uploadSuccess: ', self.uploadSuccess)

    def deleteDocument(self):
        print('deleteDocument')
        if(self.uploadMetadataSuccess & self.uploadSuccess):
            os.remove(Path('cd-upload-target/'+self.documentName))
        else:
            print('Not deleting, due to failures')

    #PUBLIC
    def processFile(self):
        print('processing file: ', self.documentName)
        self.openDocument()
        self.generatePageObjects()
        self.unstructuredOCR()
        self.generateThumbnails()
        self.uploadS3AndMetadata()
        self.printStatus()
        self.deleteDocument()

def gatherDocuments():
    certificationDocumentItr = os.scandir(Path('cd-upload-target'))
    curEpochTime = time.time()
    ageCutoff = 5
    unparsedFileObjects = []

    for doc in certificationDocumentItr:
        split = (doc.name).split('.')
        filetype = split[len(split)-1]
        documentBirthTime = doc.stat().st_mtime
        if(filetype == 'pdf' and ((curEpochTime - ageCutoff) > documentBirthTime)):
            unparsedFileObjects.append(DocumentObj(doc.name))

        for unparsedFile in unparsedFileObjects:
            unparsedFile.processFile()

# class to parse an individual document
gatherDocuments();
