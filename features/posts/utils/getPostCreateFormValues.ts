export function getPostCreateFormValues(formData: FormData) {
  return {
    content: formData.get('content'),
    publishedAt: formData.get('publishedAt'),
    title: formData.get('title'),
  }
}
