import React, { useEffect, useState } from 'react';
import { Image as Img } from '@crystallize/react-image';
import ContentTransformer from 'ui/content-transformer';
import {
  isSumaryComponent,
  isDescriptionComponent,
  isSpecsComponent,
  isRelatedProductsComponent
} from '../utils';
import ShapeComponents from 'components/shape/components';
import getRelativePriceVariants from 'lib/pricing';
import Collection from 'components/item-collection';
import * as tracker from 'lib/tracker';

import TopicTag from 'components/topic-tag';
import VariantSelector from './components/variant-selector';
import Buy from './components/buy';
import { getData } from '../get-data';
import Stock from './components/stock';
import { useTranslation } from 'lib/i18n';

import {
  Inner,
  Media,
  ImgContainer,
  Actions,
  ActionsSticky,
  Title,
  Summary,
  Content,
  Specs,
  Description,
  DescriptionWrapper,
  RelatedContainer
} from './styles';

export { getData };

export default function ProductShape({ product, locale }) {
  const { t } = useTranslation('product');
  const { name, components = [], variants = [], topics = [] } = product;

  // Set the selected variant to the default
  const [selectedVariant, setSelectedVariant] = useState(
    variants.find((variant) => variant.isDefault)
  );

  // Recommended products
  const [recommendedProducts, setRecommendedProducts] = useState(null);

  useEffect(() => {
    (async function getRecommendations() {
      if (recommendedProducts) {
        return;
      }

      await tracker.waitUntilLoaded();

      fetch(
        `/api/recommendations/${
          selectedVariant.sku
        }?visitorId=${tracker.getVisitorId()}`
      )
        .then((r) => r.json())
        .then((r) => {
          const products = r?.results?.map((p) => {
            const item = p.itemMetadata.catalogItem;
            const { productMetadata } = item;

            return {
              id: p.id,
              name: item.title,
              type: 'product',
              path: productMetadata.canonicalProductUri.replace(
                'https://recommend.superfast.shop',
                ''
              ),
              images: productMetadata.images,
              price: {
                price: productMetadata.exactPrice.originalPrice,
                currency: productMetadata.currencyCode
              }
            };
          });

          setRecommendedProducts(products);
        });
    })();
  }, []);

  function onVariantChange(variant) {
    setSelectedVariant(variant);
  }

  const pricing = getRelativePriceVariants({
    variant: selectedVariant,
    locale
  });

  const summaryComponent = components.find(isSumaryComponent);
  const descriptionComponent = components.find(isDescriptionComponent);
  const specifications = components.find(isSpecsComponent);
  const relatedProducts = components.find(isRelatedProductsComponent)?.content
    ?.items;

  // At Crystallize you can create variants of the same product.
  // It could work for sizes, colors, textures, and so on.
  // Every time we create a Product, a default variant is created of that product
  // that's why we will always have at least 1 variant.
  const hasVariants = variants.length > 1;

  return (
    <>
      <Inner>
        <Content>
          <Media>
            {selectedVariant?.images?.map((img) => (
              <ImgContainer
                key={img?.url}
                portrait={verifyImagePotraitOrientation({
                  width: img?.variants?.[0]?.width,
                  height: img?.variants?.[0].height
                })}
              >
                <Img {...img} alt={name} />
              </ImgContainer>
            ))}
          </Media>
          <Specs>
            <ShapeComponents components={[specifications]} />
          </Specs>
          {descriptionComponent && (
            <Description>
              <DescriptionWrapper>
                <ShapeComponents
                  className="description"
                  components={[descriptionComponent]}
                />
              </DescriptionWrapper>
            </Description>
          )}
        </Content>
        <Actions>
          <ActionsSticky>
            <Title>{name}</Title>
            {summaryComponent && (
              <Summary>
                <ContentTransformer json={summaryComponent?.content?.json} />
              </Summary>
            )}
            {topics?.map((topic) => (
              <TopicTag {...topic} key={topic.id} />
            ))}
            {hasVariants && (
              <VariantSelector
                variants={variants}
                selectedVariant={selectedVariant}
                onVariantChange={onVariantChange}
              />
            )}
            <Buy
              product={product}
              selectedVariant={selectedVariant}
              pricing={pricing}
            />
            <Stock selectedVariant={selectedVariant} />
          </ActionsSticky>
        </Actions>
      </Inner>

      {Boolean(relatedProducts) && (
        <RelatedContainer>
          <Collection
            items={relatedProducts}
            title={t('relatedProduct', { count: relatedProducts.length })}
          />
        </RelatedContainer>
      )}

      {Boolean(recommendedProducts) && (
        <RelatedContainer>
          <Collection
            items={recommendedProducts}
            title={t('recommendedProduct', {
              count: recommendedProducts.length
            })}
          />
        </RelatedContainer>
      )}
    </>
  );
}

function verifyImagePotraitOrientation({ width, height }) {
  return height > width;
}
