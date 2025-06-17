
const useToast = () => ({
    toast: ({ title, description }: { title: string; description: string }) => {
        console.log('Toast:', title, description);
    }
});

export default useToast;