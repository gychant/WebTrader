"""
Module for logging
"""
import logging


def get_logger(log_file=None, filemode='a', level=logging.INFO):
    logger = logging.getLogger()
    logger.handlers.clear()
    logger.setLevel(level)
    formatter = logging.Formatter('%(asctime)s %(message)s')
    handler = logging.StreamHandler()
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    if log_file is not None:
        handler = logging.FileHandler(log_file, mode=filemode)
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    return logger

logger = get_logger(log_file="./log.txt", filemode='a')