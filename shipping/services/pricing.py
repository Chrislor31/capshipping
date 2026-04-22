
def calculate_price(package):

    from shipping.models import PricingRule, RoutePricing

    # 🔹 1. CHÈCHE ROUTE
    route = RoutePricing.objects.filter(
        origin_type=package.origin_warehouse.type,
        destination_type=package.destination_warehouse.type,
        shipping_type=package.shipping_type
    ).first()

    # 🔹 2. DETERMINE PRICE PER LB
    if route:
        price_per_lb = float(route.price_per_lb)
    else:
        rule = PricingRule.objects.get(shipping_type=package.shipping_type)
        price_per_lb = float(rule.price_per_lb)

    # 🔹 3. PREND RULE (pou divisor & minimum)
    rule = PricingRule.objects.get(shipping_type=package.shipping_type)
    divisor = rule.volumetric_divisor
    minimum = float(rule.minimum_charge)

    # 🔹 4. VOLUME
    volume = package.length * package.width * package.height
    volumetric_weight = volume / divisor

    # 🔹 5. CHARGEABLE WEIGHT
    chargeable_weight = max(package.weight, volumetric_weight)

    # 🔹 6. BASE COST
    base_cost = chargeable_weight * price_per_lb

    # 🔹 7. CATEGORY SURCHARGE
    category_fee = float(package.category.surcharge) if package.category else 0

    # 🔹 8. TOTAL
    total = (base_cost * package.quantity) + category_fee + float(package.extra_fee)

    # 🔹 9. MINIMUM
    if total < minimum:
        total = minimum

    return round(total, 2)