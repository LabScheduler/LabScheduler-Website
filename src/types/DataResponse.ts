export interface DataResponse<T> {
    success: boolean;
    message: string;
    data: T;
}