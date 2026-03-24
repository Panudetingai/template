"use client";

import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/components/animate/tabs";
import StreamingResponse from "@/components/streaming";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { useTextStream } from "@/components/ui/response-stream";
import { api } from "@/lib/elysia/eden-client";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon, CopyIcon, Sparkles } from "lucide-react";
import { markdownToTxt } from "markdown-to-txt";
import { useCallback, useState } from "react";
import { formatMarkdown } from "../services/lib/formatterMarkdown";
import { Platform, useGeneratorStore } from "../stores/use-generator";
import { PreviewPosts, usePreviewStore } from "../stores/use-preview";
function CopyButton({
  posts,
  activeValue,
}: {
  posts: PreviewPosts;
  activeValue: Platform;
}) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const content = posts[activeValue]?.content ?? "";
    navigator.clipboard.writeText(markdownToTxt(content));
    setIsCopied(true);
  }, [posts, activeValue]);

  setTimeout(() => {
    setIsCopied(false);
  }, 250 * 60);

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      <AnimatePresence initial={false} mode="wait">
        {isCopied ? (
          <motion.span
            key="copied"
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            Copied
            <CheckIcon className="size-4" />
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            Copy
            <CopyIcon className="size-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}

export default function GeneratePreview() {
  const posts = usePreviewStore((state) => state.posts);
  const [activePlatform, setActivePlatform] = useState<Platform>("twitter");
  const [streamedPlatforms, setStreamedPlatforms] = useState<Set<Platform>>(
    () => new Set(),
  );

  const content = posts[activePlatform]?.content ?? "";
  const shouldStream = Boolean(
    content && !streamedPlatforms.has(activePlatform),
  );
  const handleStreamComplete = useCallback(
    () => setStreamedPlatforms((prev) => new Set(prev).add(activePlatform)),
    [activePlatform],
  );
  const { displayedText } = useTextStream({
    textStream: shouldStream ? formatMarkdown(content) : "",
    speed: 60,
    onComplete: shouldStream ? handleStreamComplete : undefined,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <h1 className="text-lg font-semibold">Generate Preview</h1>
        <p className="text-muted-foreground text-sm">
          Preview the posts that will be generated
        </p>
      </div>
      <div>
        <Tabs
          value={activePlatform}
          onValueChange={(v) => setActivePlatform(v as Platform)}
        >
          <div className="flex justify-between items-center">
            <TabsList>
              {Object.keys(posts).map((platform) => (
                <TabsTrigger key={platform} value={platform}>
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
            <CopyButton posts={posts} activeValue={activePlatform} />
          </div>
          <TabsContents>
            {Object.keys(posts).map((platform) => {
              const platformKey = platform as Platform;
              const platformContent = posts[platformKey]?.content ?? "";
              const isActive = platformKey === activePlatform;
              const showStream = isActive && shouldStream && platformContent;
              return (
                <TabsContent key={platform} value={platform} className="mt-2">
                  {platformContent ? (
                    <StreamingResponse
                      textStream={
                        showStream
                          ? displayedText
                          : formatMarkdown(platformContent)
                      }
                      mode={showStream ? "streaming" : "static"}
                    />
                  ) : (
                    <GeneratePostforPlatform platform={platformKey} />
                  )}
                </TabsContent>
              );
            })}
          </TabsContents>
        </Tabs>
      </div>
    </div>
  );
}

function GeneratePostforPlatform({ platform }: { platform: Platform }) {
  const { selectedCommit, selectedTone, selectedRepository } =
    useGeneratorStore();
  const setPosts = usePreviewStore((state) => state.setPosts);
  const { mutate: handleGeneratePost, isPending: isGeneratingPost } =
    useMutation({
      mutationFn: async () => {
        const response = await api.generator.posts.post({
          platforms: [platform],
          tones: selectedTone,
          repository: selectedRepository,
          commit: selectedCommit.commits,
        });
        if (response.error) throw new Error(response.error.message as string);
        setPosts((prev) => ({
          ...prev,
          [platform]: {
            content: response.data[0]?.content ?? null,
          },
        }));
        return response.data;
      },
    });
  return (
    <div className="flex justify-center items-center h-52 flex-col gap-4">
      {!isGeneratingPost && (
        <p className="text-muted-foreground text-sm">
          Sorry, there is no generated post for{" "}
          {platform.charAt(0).toUpperCase() + platform.slice(1)} yet. Click
          below to create one!
        </p>
      )}
      {isGeneratingPost ? (
        <>
          <Loader size="lg" variant="wave" />
          <Loader
            size="lg"
            text={`${platform.charAt(0).toUpperCase() + platform.slice(1)} is generating...`}
            variant="text-shimmer"
          />
        </>
      ) : (
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleGeneratePost()}
        >
          <Sparkles className="size-4" />
          <span className="text-sm">
            Generate Post for{" "}
            {platform.charAt(0).toUpperCase() + platform.slice(1)}
          </span>
        </Button>
      )}
    </div>
  );
}
