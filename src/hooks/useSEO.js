import { useEffect } from 'react'

/**
 * A custom React hook to dynamically update HTML head tags for SEO.
 * @param {Object} seo
 * @param {string} seo.title - Page title tag.
 * @param {string} seo.description - Page meta description.
 * @param {string} [seo.ogTitle] - Open Graph title.
 * @param {string} [seo.ogDescription] - Open Graph description.
 * @param {string} [seo.ogImage] - Open Graph preview image URL.
 * @param {string} [seo.ogUrl] - Open Graph page URL.
 */
export default function useSEO({ title, description, ogTitle, ogDescription, ogImage, ogUrl } = {}) {
  useEffect(() => {
    // 1. Title Tag
    if (title) {
      document.title = title
    }

    // 2. Meta Description
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]')
      if (!metaDesc) {
        metaDesc = document.createElement('meta')
        metaDesc.setAttribute('name', 'description')
        document.head.appendChild(metaDesc)
      }
      metaDesc.setAttribute('content', description)
    }

    // 3. Open Graph Title
    if (ogTitle || title) {
      let metaOgTitle = document.querySelector('meta[property="og:title"]')
      if (!metaOgTitle) {
        metaOgTitle = document.createElement('meta')
        metaOgTitle.setAttribute('property', 'og:title')
        document.head.appendChild(metaOgTitle)
      }
      metaOgTitle.setAttribute('content', ogTitle || title)
    }

    // 4. Open Graph Description
    if (ogDescription || description) {
      let metaOgDesc = document.querySelector('meta[property="og:description"]')
      if (!metaOgDesc) {
        metaOgDesc = document.createElement('meta')
        metaOgDesc.setAttribute('property', 'og:description')
        document.head.appendChild(metaOgDesc)
      }
      metaOgDesc.setAttribute('content', ogDescription || description)
    }

    // 5. Open Graph Image
    if (ogImage) {
      let metaOgImg = document.querySelector('meta[property="og:image"]')
      if (!metaOgImg) {
        metaOgImg = document.createElement('meta')
        metaOgImg.setAttribute('property', 'og:image')
        document.head.appendChild(metaOgImg)
      }
      metaOgImg.setAttribute('content', ogImage)
    }

    // 6. Open Graph URL
    if (ogUrl) {
      let metaOgUrl = document.querySelector('meta[property="og:url"]')
      if (!metaOgUrl) {
        metaOgUrl = document.createElement('meta')
        metaOgUrl.setAttribute('property', 'og:url')
        document.head.appendChild(metaOgUrl)
      }
      metaOgUrl.setAttribute('content', ogUrl)
    }
  }, [title, description, ogTitle, ogDescription, ogImage, ogUrl])
}
