package com.atob.atobapp.service;

public enum StatusService {
        Pending, // waiting this valued,
        processing, // money waiting,
        WaitingCarrier, // can not change status for processing,
        Shippet, // can not change status for processing,
        Delivered // can not change status for processing,
    }

