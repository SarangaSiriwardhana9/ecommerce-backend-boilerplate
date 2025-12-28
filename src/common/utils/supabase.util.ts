import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

let supabaseClient: SupabaseClient | null = null;


function getSupabaseClient(): SupabaseClient | null {

    if (!supabaseClient) {
        supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    }

    return supabaseClient;
}

/**
 * Delete a product image from Supabase storage
 * @param imageUrl - Full URL of the image to delete
 */
export async function deleteProductImage(imageUrl: string): Promise<void> {
    try {
        const supabase = getSupabaseClient();

        // Skip if Supabase is not configured
        if (!supabase) {
            return;
        }


        const pathMatch = imageUrl.match(/\/product-images\/(.+)$/);

        if (!pathMatch || !pathMatch[1]) {
            console.warn('Could not extract path from image URL:', imageUrl);
            return;
        }

        const filePath = pathMatch[1];

        const { error } = await supabase.storage
            .from('product-images')
            .remove([filePath]);

        if (error) {
            console.error('Error deleting image from Supabase:', error);
            throw error;
        }

        console.log('✅ Deleted image from Supabase:', filePath);
    } catch (error) {
        console.error('Failed to delete image from Supabase:', error);
        // Don't throw - we don't want to block product deletion if image deletion fails
    }
}

/**
 * Delete multiple product images from Supabase storage
 * @param imageUrls - Array of image URLs to delete
 */
export async function deleteProductImages(imageUrls: string[]): Promise<void> {
    const deletePromises = imageUrls.map(url => deleteProductImage(url));
    await Promise.allSettled(deletePromises);
}
