package com.atob.atobapp.service;

public enum StatusService {
    Pending, // waiting this valued,
    Processing, // money waiting,
    WaitingCarrier, // can not change status for processing,
    Shippet, // can not change status for processing,
    Delivered // can not change status for processing,
}

