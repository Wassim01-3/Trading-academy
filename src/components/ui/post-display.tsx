import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Image as ImageIcon, Video } from "lucide-react";
import { Post } from "@/integrations/api/client";

interface PostDisplayProps {
  posts: Post[];
}

export const PostDisplay = ({ posts }: PostDisplayProps) => {
  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post.id} className="p-6 bg-card border-border">
          {/* Title */}
          <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
          
          {/* Video */}
          {post.videoUrl && (
            <div className="mb-4 aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              {post.videoUrl.includes('youtube.com') || post.videoUrl.includes('youtu.be') || post.videoUrl.includes('embed') ? (
                <iframe
                  src={post.videoUrl}
                  className="w-full h-full rounded-lg border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={post.videoUrl}
                  controls
                  className="w-full h-full rounded-lg"
                />
              )}
            </div>
          )}

          {/* File Widgets */}
          {(post.pdfUrl || post.docUrl || post.imageUrl) && (
            <div className="flex gap-4 mb-4 flex-wrap">
              {post.pdfUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(post.pdfUrl!, `post-${post.id}.pdf`)}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4 text-red-500" />
                  PDF
                </Button>
              )}
              {post.docUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(post.docUrl!, `post-${post.id}.doc`)}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4 text-blue-500" />
                  DOC
                </Button>
              )}
              {post.imageUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(post.imageUrl!, `post-${post.id}.jpg`)}
                  className="flex items-center gap-2"
                >
                  <ImageIcon className="h-4 w-4 text-green-500" />
                  Image
                </Button>
              )}
            </div>
          )}

          {/* Description */}
          {post.description && (
            <div className="prose prose-invert max-w-none">
              <p className="text-muted-foreground whitespace-pre-wrap">{post.description}</p>
            </div>
          )}
        </Card>
      ))}
      
      {posts.length === 0 && (
        <Card className="p-12 text-center bg-card border-border">
          <p className="text-muted-foreground">No posts available for this section yet.</p>
        </Card>
      )}
    </div>
  );
};

