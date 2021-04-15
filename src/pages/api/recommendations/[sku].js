export default async (req, res) => {
  const response = await fetch(
    // `https://retail.googleapis.com/v2/projects/${process.env.NEXT_PUBLIC_GRE_PROJECTID}/locations/global/catalogs/default_catalog/placements/recently_viewed_default:predict?token=${process.env.NEXT_PUBLIC_GRE_APIKEY}`,
    `https://recommendationengine.clients6.google.com/v1beta1/projects/${process.env.GRE_PROJECTNUMBER}/locations/global/catalogs/default_catalog/eventStores/default_event_store/placements/recently_viewed_default:predict?key=${process.env.NEXT_PUBLIC_GRE_APIKEY}`,
    {
      method: 'post',
      headers: {
        user: process.env.NEXT_PUBLIC_GRE_APIKEY,
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        dryRun: false,
        params: {
          returnCatalogItem: true
        },
        userEvent: {
          eventType: 'detail-page-view',
          userInfo: {
            visitorId: req.query.visitorId
          },
          productEventDetail: {
            productDetails: [
              {
                id: req.query.sku
              }
            ]
          }
        }
      })
    }
  );

  if (!response.ok) {
    res.json(await response.json());
    return;
    // throw new Error('Could not get recommendations');
  }

  res.json(await response.json());

  // res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
};
