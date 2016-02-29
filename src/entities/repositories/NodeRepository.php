<?php
namespace SeArch\Entities\Repositories;
use Doctrine\ORM\EntityRepository;

class NodeRepository extends EntityRepository {
	public function findInCircle($layer, $x, $y, $radius) {
		$query = $this->getEntityManager()->createQuery("SELECT el FROM :Node el WHERE ST_Intersects(ST_Transform(".
		"el.geom,3857),ST_Buffer(ST_SetSRID(ST_Point( :x, :y),3857), :radius)) = true AND el.layer = :layer");
		$query->setParameters(array(
			'x'=>$x,
			'y'=>$y,
			'radius'=>$radius*10,
			'layer'=>$layer
		));
		return $query->getResult();
	}

	public function findInPolygon($points, $layer = 1) {
		$points = implode(',',
			array_map(function($point) {
				return implode(' ', $point);
			}, $points)
		);

		$query = $this->getEntityManager()->createQuery("SELECT el FROM :Node el WHERE ST_Intersects(ST_Transform(".
			"el.geom,3857),ST_MakePolygon(ST_GeomFromText('LINESTRING(" . $points ." )', 3857))) = true AND el.layer = :layer");
		$query->setParameters(array(
			'layer'=>$layer
		));
		return $query->getResult();
	}

	public function findClosest($layers, $x, $y, $maxradius) {
		$query = $this->getEntityManager()->createQuery(
			"SELECT el FROM :Node el".
			" WHERE ST_Intersects(ST_Transform(".
				"el.geom,3857),ST_Buffer(ST_SetSRID(ST_Point( :x, :y),3857), :radius)) = true" .
			" AND el.layer IN (:layers)".
			" ORDER BY ST_DISTANCE(ST_Transform(el.geom, 3857), ST_SetSRID(ST_Point(:x, :y), 3857)) ASC"
		);
		$query->setMaxResults(1);
		$query->setParameters(array(
			'x'=>$x,
			'y'=>$y,
			'radius'=>$maxradius*1000,
			'layers'=> array_map(
				function($layer) {
					return $layer->getId();
				},
				$layers
			)
		));
		return $query->getResult();
	}
}
