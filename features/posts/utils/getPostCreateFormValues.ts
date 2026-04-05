export function getPostCreateFormValues(formData: FormData) {
  return {
    content: formData.get('content'),
    description: formData.get('description'),
    publishedAt: formData.get('publishedAt'),
    title: formData.get('title'),
  }
}
