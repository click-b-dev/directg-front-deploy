<?php

declare(strict_types=1);

namespace HTMLToMarkdown;

use HTMLToMarkdown\Converter\BlockquoteConverter;
use HTMLToMarkdown\Converter\CodeConverter;
use HTMLToMarkdown\Converter\CommentConverter;
use HTMLToMarkdown\Converter\ConverterInterface;
use HTMLToMarkdown\Converter\DefaultConverter;
use HTMLToMarkdown\Converter\DivConverter;
use HTMLToMarkdown\Converter\EmphasisConverter;
use HTMLToMarkdown\Converter\HardBreakConverter;
use HTMLToMarkdown\Converter\HeaderConverter;
use HTMLToMarkdown\Converter\HorizontalRuleConverter;
use HTMLToMarkdown\Converter\ImageConverter;
use HTMLToMarkdown\Converter\LinkConverter;
use HTMLToMarkdown\Converter\ListBlockConverter;
use HTMLToMarkdown\Converter\ListItemConverter;
use HTMLToMarkdown\Converter\ParagraphConverter;
use HTMLToMarkdown\Converter\PreformattedConverter;
use HTMLToMarkdown\Converter\TextConverter;

final class Environment
{
    /** @var Configuration */
    protected $config;

    /** @var ConverterInterface[] */
    protected $converters = [];

    /**
     * @param array<string, mixed> $config
     */
    public function __construct(array $config = [])
    {
        $this->config = new Configuration($config);
        $this->addConverter(new DefaultConverter());
    }

    public function getConfig(): Configuration
    {
        return $this->config;
    }

    public function addConverter(ConverterInterface $converter): void
    {
        if ($converter instanceof ConfigurationAwareInterface) {
            $converter->setConfig($this->config);
        }

        foreach ($converter->getSupportedTags() as $tag) {
            $this->converters[$tag] = $converter;
        }
    }

    public function getConverterByTag(string $tag): ConverterInterface
    {
        if (isset($this->converters[$tag])) {
            return $this->converters[$tag];
        }

        return $this->converters[DefaultConverter::DEFAULT_CONVERTER];
    }

    /**
     * @param array<string, mixed> $config
     */
    public static function createDefaultEnvironment(array $config = []): Environment
    {
        $environment = new static($config);

        $environment->addConverter(new BlockquoteConverter());
        $environment->addConverter(new CodeConverter());
        $environment->addConverter(new CommentConverter());
        $environment->addConverter(new DivConverter());
        $environment->addConverter(new EmphasisConverter());
        $environment->addConverter(new HardBreakConverter());
        $environment->addConverter(new HeaderConverter());
        $environment->addConverter(new HorizontalRuleConverter());
        $environment->addConverter(new ImageConverter());
        $environment->addConverter(new LinkConverter());
        $environment->addConverter(new ListBlockConverter());
        $environment->addConverter(new ListItemConverter());
        $environment->addConverter(new ParagraphConverter());
        $environment->addConverter(new PreformattedConverter());
        $environment->addConverter(new TextConverter());

        return $environment;
    }
}
