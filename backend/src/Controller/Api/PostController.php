<?php

namespace App\Controller\Api;

use App\Entity\Post;
use App\Repository\PostRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/posts', name: 'api_posts_')]
class PostController extends BaseApiController
{
    public function __construct(
        private PostRepository $postRepository,
        private EntityManagerInterface $entityManager,
        private ValidatorInterface $validator
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function list(Request $request): JsonResponse
    {
        $chapter = $request->query->get('chapter');
        $menu = $request->query->get('menu');
        $submenu = $request->query->get('submenu');

        if ($chapter) {
            $posts = $this->postRepository->findByChapter($chapter);
        } elseif ($submenu) {
            $posts = $this->postRepository->findBySubmenu($submenu);
        } elseif ($menu) {
            $posts = $this->postRepository->findByMenu($menu);
        } else {
            $posts = $this->postRepository->findAll();
        }

        $postsData = array_map(function ($post) {
            return [
                'id' => $post->getId(),
                'title' => $post->getTitle(),
                'description' => $post->getDescription(),
                'videoUrl' => $post->getVideoUrl(),
                'pdfUrl' => $post->getPdfUrl(),
                'docUrl' => $post->getDocUrl(),
                'imageUrl' => $post->getImageUrl(),
                'chapter' => $post->getChapter(),
                'menu' => $post->getMenu(),
                'submenu' => $post->getSubmenu(),
                'orderIndex' => $post->getOrderIndex(),
                'createdAt' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
            ];
        }, $posts);

        return new JsonResponse(['posts' => $postsData]);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['title'])) {
            return new JsonResponse(['error' => 'Title is required'], Response::HTTP_BAD_REQUEST);
        }

        $post = new Post();
        $post->setTitle($data['title']);
        $post->setDescription($data['description'] ?? null);
        $post->setVideoUrl($data['videoUrl'] ?? null);
        $post->setPdfUrl($data['pdfUrl'] ?? null);
        $post->setDocUrl($data['docUrl'] ?? null);
        $post->setImageUrl($data['imageUrl'] ?? null);
        $post->setChapter($data['chapter'] ?? null);
        $post->setMenu($data['menu'] ?? null);
        $post->setSubmenu($data['submenu'] ?? null);
        $post->setOrderIndex($data['orderIndex'] ?? 0);

        $errors = $this->validator->validate($post);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return new JsonResponse(['error' => $errorMessages], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->persist($post);
        $this->entityManager->flush();

        return new JsonResponse([
            'message' => 'Post created successfully',
            'post' => [
                'id' => $post->getId(),
                'title' => $post->getTitle(),
            ]
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    public function update(int $id, Request $request): JsonResponse
    {
        $post = $this->postRepository->find($id);

        if (!$post) {
            return new JsonResponse(['error' => 'Post not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['title'])) $post->setTitle($data['title']);
        if (isset($data['description'])) $post->setDescription($data['description']);
        if (isset($data['videoUrl'])) $post->setVideoUrl($data['videoUrl']);
        if (isset($data['pdfUrl'])) $post->setPdfUrl($data['pdfUrl']);
        if (isset($data['docUrl'])) $post->setDocUrl($data['docUrl']);
        if (isset($data['imageUrl'])) $post->setImageUrl($data['imageUrl']);
        if (isset($data['orderIndex'])) $post->setOrderIndex($data['orderIndex']);

        $post->setUpdatedAt(new \DateTime());
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Post updated successfully']);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(int $id): JsonResponse
    {
        $post = $this->postRepository->find($id);

        if (!$post) {
            return new JsonResponse(['error' => 'Post not found'], Response::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($post);
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Post deleted successfully']);
    }
}

