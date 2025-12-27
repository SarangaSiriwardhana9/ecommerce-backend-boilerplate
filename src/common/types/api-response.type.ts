export interface ApiResponse<T> {
    data: T;
    message?: string;
    statusCode?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
