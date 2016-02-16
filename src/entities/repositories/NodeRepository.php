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
