
export const loadingState = $state({
    message: '',
    isLoading: false
});
export function startLoading(msg = "Processing...") {
    loadingState.isLoading = true;
    loadingState.message = msg;
}
export function stopLoading() {
    loadingState.message = '';
    loadingState.isLoading = false;
}
export const userState = $state({
    
});